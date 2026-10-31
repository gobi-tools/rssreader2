To setup a remote machine:
--------------------------

```bash
# Update your package lists
sudo apt update

# Install Docker
sudo apt install docker.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo apt install docker-compose

# Install unzip
apt install unzip

# install supervisor
sudo apt install supervisor
```


Copy files:
-----------

```bash
scp -r /path/to/your/project your_username@your_hetzner_ip:/path/to/destination/
```

Run project remotely
--------------------

```bash
# kill supervisord
ps aux | grep supervisord

# this will delete everything
docker-compose -f docker-compose.prod.yml down -v 

# run the app
docker-compose -f docker-compose.prod.yml up --build --remove-orphans -d

# restart supervisor (or not)
nohup supervisord -c supervisor/supervisord.conf &
```