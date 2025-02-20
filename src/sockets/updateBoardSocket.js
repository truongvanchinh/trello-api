export const updateBoardSocket = (socket) => {
  socket.on('FE_board_update', (board) => {
    //Cách làm nhanh và đơn giản nhất: emit ngc lại 1 sk về cho mọi client khác (ngoại trừ chính cái thằng gửi request lên), rồi để phía FE check
    socket.broadcast.emit('BE_board_update', board)
  })
}