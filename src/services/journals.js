import api from "./api";

const getAllJournals = async (params = {}) => {
  // api instance automatically adds token via interceptor
  const response = await api.get("/journals", { params });
  return response.data;
};

const getJournalById = async (id) => {
  const response = await api.get(`/journals/${id}`);
  return response.data;
};

const createJournal = async (newJournal) => {
  const response = await api.post("/journals", newJournal);
  return response.data;
};

const updateJournal = async (id, updatedJournal) => {
  const response = await api.put(`/journals/${id}`, updatedJournal);
  return response.data;
};

const deleteJournal = async (id) => {
  const response = await api.delete(`/journals/${id}`);
  return response.data;
};

export default {
  getAllJournals,
  getJournalById,
  createJournal,
  updateJournal,
  deleteJournal,
};
