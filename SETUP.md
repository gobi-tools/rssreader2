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
sudo apt install unzip
```


Cutting a release:
------------------

On your local machine, from the project root:

```bash
# release named <timestamp>-<git-hash>
./scripts/release.sh

# or give the release an explicit name
./scripts/release.sh 1.4.0
```

This writes `release/rssreader2-<name>.zip`. It contains everything the
server needs to build and run the app — and never the `data/` folder, so
the production database can't be overwritten.


Copy files:
-----------

```bash
scp release/rssreader2-<name>.zip your_username@your_hetzner_ip:/path/to/destination/
```

Unzip:
------

The zip contains a top-level `rssreader2-<name>/` folder, so it unpacks
into a clean directory:

```bash
unzip rssreader2-<name>.zip -d /path/to/destination/
```

The production database lives in `data/` **on the server** and is mounted
into the container with a bind mount. It is never part of the zip, so
unzipping a new release never touches it.


Run project remotely:
---------------------

```bash
cd rssreader2-<name>

# (optional) stop a previous run — does NOT delete the database:
# data/ is a bind mount, not a named volume, so `-v` can't touch it
docker-compose -f docker-compose.prod.yml down

# run the app
docker-compose -f docker-compose.prod.yml up --build --remove-orphans -d
```


Notes:
------

- The app is only reachable through the reverse proxy on port 80
  (`http://<server-ip>`); the app container publishes no host port.
- `BETTER_AUTH_URL` in `docker-compose.prod.yml` must match the public
  URL you use to reach the app (e.g. `http://116.203.52.35`).
- Migrations are not run automatically at startup. If you change the
  drizzle schema, apply migrations on the server yourself before
  restarting the container.
