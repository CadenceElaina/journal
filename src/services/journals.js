import axios from "axios";
const baseUrl = "/api/journals";

let token = null;

const setToken = (newToken) => {
  token = `Bearer ${newToken}`;
};

const getAllJournals = async (params = {}) => {
  const config = {
    headers: { Authorization: token },
    params: params, //term, tags, moods, startDate, endDate, date, sort, page, limit
  };
  const response = await axios.get(baseUrl, config);
  return response.data;
};

const getJournalById = async (id) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.get(`${baseUrl}/${id}`, config);
  return response.data;
};

const createJournal = async (newJournal) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.post(baseUrl, newJournal, config);
  return response.data;
};

const updateJournal = async (id, updatedJournal) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.put(`${baseUrl}/${id}`, updatedJournal, config);
  return response.data;
};

const removeJournal = async (id) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.delete(`$baseUrl}/${id}, config`);
  return response.data;
};

export default {
  setToken,
  getAllJournals,
  getJournalById,
  createJournal,
  updateJournal,
  removeJournal,
};
