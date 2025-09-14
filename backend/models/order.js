let orders = [];
let nextId = 1;

async function getAll() {
  return orders;
}

async function findById(id) {
  return orders.find((o) => o.id === Number(id));
}

async function create(data) {
  const order = { id: nextId++, ...data };
  orders.push(order);
  return order;
}

async function update(id, data) {
  const index = orders.findIndex((o) => o.id === Number(id));
  if (index === -1) return null;
  orders[index] = { ...orders[index], ...data };
  return orders[index];
}

async function remove(id) {
  const index = orders.findIndex((o) => o.id === Number(id));
  if (index === -1) return false;
  orders.splice(index, 1);
  return true;
}

module.exports = {
  getAll,
  findById,
  create,
  update,
  remove,
};
