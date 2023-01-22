# About project

This is a research project related to reinforcement learning/multiarmed bandit/federated learing.

# Team Members

- Maddie Shang (Team Lead)
- Shashi Gharti

# Folder structure:

- Backend server folder (django) => server
- Frontend client => client

# Getting Started

## Backend Server

Create virtual env for python and run the following commands:

### Install dependencies

- Go to the folder server and install dependencies
  pip install -r requirements.php

### Set ENV

Go to path server > fl_server

- Rename .env.sample file to .env

### Run Migrations

- python manage.py makemigrations
- python manage.py migrate

### Seed ServerData Table

- python manage.py loaddata core/fixtures/init-data.json

### Run Server

- python manage.py runserver

## Frontend Server

- Go to the client folder and install dependencies
  npm install

### Set ENV

- Rename .env.sample file to .env

### Run Client

- npm run start

## Run using Docker
- docker up -d

API_ENDPOINT=http://0.0.0.0:8082
WS_ENDPOINT=0.0.0.0:8082
MODE=development
STOP_AFTER=100
SIMULATION=True