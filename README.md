## Trang web làm lại Trello (Ứng dụn kéo thả, phân công việc làm)

### check Docker ở cmd
```
docker -v
```

### Tạo network:
```
docker network create app-network
```
## BACK-END
### Tạo file .env lưu biến MONGODB_URI
tạo các biến cần thiết theo .env.example

### Run Back-end (trello-api):
```
cd ./trello-api-master
docker-compose up --build
```
## FRONT-END
### Run Front-end(trello-web):
```
cd ./trello-web-master
docker-compose up --build
```

