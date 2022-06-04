docker stop pesonet-be
docker rm pesonet-be
docker rmi backend

docker build -t backend .
docker run -d -p 3333:3333 --name pesonet-be backend
docker image prune -f