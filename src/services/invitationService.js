import { invitationModel } from '~/models/invitationModel'
import { boardModel } from '~/models/boardModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { pickUser } from '~/utils/formater'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // Người đi mời: chính là người đang request, nên chúng ta tìm theo id lấy từ token
    const inviter = await userModel.findOneById(inviterId)
    // Người được mời: lày theo email nhận từ phía FE
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
    // Tìm luôn cái board ra đề lầy data xử lý
    const board = await boardModel.findOneById(reqBody.boardId)
    // Nều không tồn tại 1 trong 3 thì cứ thẳng tay reject
    if (!inviter || !invitee || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
    }

    // KT xem có đang mời chính nó hay không
    //...
    // Kt nó có trong board hay chưa
    //...

    // Tạo data cần thiết để lưu vào trong DB
    // Có thể thử bỏ hoặc làm sai lệch type, boardInvitation, status đề test xem Model validate ok chưa.
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(), // chuyển từ ObjectId về String vì sang bên Model có check lại data ở hàm create
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }
    //Gọi sang Model để lưu vào DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

    // Ngoài thông tin của cái board invitation mới tạo thì trả về dù cả luôn board, inviter, invitee cho Fẽ thoải mái xử lý.
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      intitee: pickUser(invitee)
    }
    return resInvitation
  } catch (error) {
    throw error
  }
}

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)
    // console.log('getInvitations: ', getInvitations)
    // Vì các dữ liệu inviter, invitee và board là đang ở giá trị màng 1 phần từ nều lấy ra được nên chúng ta biễn đồi nó về Json Object trước khi trả về
    const resInvitations = getInvitations.map(i => ({
      ...i,
      inviter: i.inviter[0] || {},
      invitee: i.invitee[0] || {},
      board: i.board[0] || {}
    }))
    return resInvitations
  } catch (error) { throw error }
}

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    const getInvitation = await invitationModel.findOneById(invitationId)
    if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')

    const boardId = getInvitation.boardInvitation.boardId
    const getBoard = await boardModel.findOneById(boardId)
    if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    // Kiểm tra xem nếu status là ACCEPTED join board mà cái thằng user (invitee) đã là owner hoặc member của board rồi thì trả về thông báo lỗi luôn.
    // Note: 2 màng memberIds và ownerIds của board nó đang là kiểu dữ liệu ObjectId nên cho nó về String hết Luôn đề check
    const boardOwnerAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds].toString()
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of this board!')
    }

    // Tạo dữ liệu để update bản ghi Invitation
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status
      }
    }

    // Bước 1: Cập nhật status trong bản ghi Invitation
    const updatedInvitation = await invitationModel.update(invitationId, updateData)
    // Bước 2: Nều trường hợp Accept một lời mời thành công, thì cần phải thêm thông tin của thằng user (userId) vào bản ghi memberids trong collection board.
    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMemberIds(boardId, userId)
    }
    return updatedInvitation
  } catch (error) { throw error }
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}
