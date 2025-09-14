let requests = [];
let nextId = 1;

async function getAll() {
  return requests;
}

async function findById(id) {
  return requests.find((r) => r.id === Number(id));
}

async function create(data) {
  const request = { id: nextId++, ...data };
  requests.push(request);
  return request;
}

async function update(id, data) {
  const index = requests.findIndex((r) => r.id === Number(id));
  if (index === -1) return null;
  requests[index] = { ...requests[index], ...data };
  return requests[index];
}

async function remove(id) {
  const index = requests.findIndex((r) => r.id === Number(id));
  if (index === -1) return false;
  requests.splice(index, 1);
  return true;
}

module.exports = {
  getAll,
  findById,
  create,
  update,
  remove,
};
