//Param socket sẽ được lấy từ thư viện socket.io
export const inviteUserToBoardSocket = (socket, io) => {
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    //Cách làm nhanh và đơn giản nhất: emit ngc lại 1 sk về cho mọi client khác (ngoại trừ chính cái thằng gửi request lên), rồi để phía FE check
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
  socket.on('FE_BOARD_INVITATION_ACCEPTED', (data) => {
    io.emit('BOARD_MEMBER_UPDATED', data)
  })
}