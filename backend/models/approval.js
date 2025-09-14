let approvals = [];
let nextId = 1;

async function getAll() {
  return approvals;
}

async function findById(id) {
  return approvals.find((a) => a.id === Number(id));
}

async function create(data) {
  const approval = { id: nextId++, ...data };
  approvals.push(approval);
  return approval;
}

async function update(id, data) {
  const index = approvals.findIndex((a) => a.id === Number(id));
  if (index === -1) return null;
  approvals[index] = { ...approvals[index], ...data };
  return approvals[index];
}

async function remove(id) {
  const index = approvals.findIndex((a) => a.id === Number(id));
  if (index === -1) return false;
  approvals.splice(index, 1);
  return true;
}

module.exports = {
  getAll,
  findById,
  create,
  update,
  remove,
};
