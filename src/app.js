const express = require('express');
const cors = require('cors');

const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());
app.use(requestStart, logRequests);
app.use('/repositories/:id', validateRepoID, isIDInRepositories);

const repositories = [];

app.get('/repositories', (request, response) => {
  // TODO
  response.json(repositories);
});

app.post('/repositories', (request, response) => {
  const { title, url, techs } = request.body;

  const repo = { id: uuid(), title, url, techs, likes: 0 };

  repositories.push(repo);

  return response.json(repo);
});

app.put('/repositories/:id', (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const { foundRepoIdx } = response.locals;
  const { likes } = repositories[foundRepoIdx];

  repositories[foundRepoIdx] = { id, title, url, techs, likes };

  response.json(repositories[foundRepoIdx]);
});

app.delete('/repositories/:id', (request, response) => {
  const { foundRepoIdx } = response.locals;

  repositories.splice(foundRepoIdx, 1);

  return response.status(204).send();
});

app.post('/repositories/:id/like', (request, response) => {
  const { foundRepoIdx } = response.locals;

  repositories[foundRepoIdx].likes += 1;

  return response.send(repositories[foundRepoIdx]);
});

module.exports = app;

// ******************

function logRequests(request, response, next) {
  const logLabel = `[${request.method}] ${request.url}`;

  next();

  const endTime = Date.now();

  console.log(`${logLabel}: ${(endTime - request.startTime).toFixed(3)}ms`);
}

function validateRepoID(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Repository ID: Invalid' });
  }

  next();
}

function isIDInRepositories(request, response, next) {
  const { id } = request.params;
  const repoIdx = repositories.findIndex((r) => r.id == id);

  if (repoIdx < 0) {
    return response.status(400).json({ error: 'Repository: not found.' });
  }

  response.locals.foundRepoIdx = repoIdx;

  next();
}

function requestStart(request, response, next) {
  request.startTime = Date.now();
  next();
}
