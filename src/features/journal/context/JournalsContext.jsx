import React, { createContext, useContext, useEffect, useState } from "react";
import journalsService from "../../../services/journals";

const JournalsContext = createContext(null);

const VIEWS = {
  MY_JOURNALS: "myJournals",
  SHARED_JOURNALS: "sharedJournals", // filter by professionals client's journals?
};

export const JournalsProvider = ({ children }) => {
  const [view, setView] = useState(VIEWS.MY_JOURNALS);
  const [journals, setJournals] = useState([]);
  const [searchAndFilters, setSearchAndFilters] = useState({
    term: "",
    tags: [],
    moods: [],
    startDate: null,
    endDate: null,
    date: null,
    sort: "", //newest is default
    page: 1,
    limit: 0,
    isShared: false,
  });
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalJournals: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  //token synchronization
  const [token, setToken] = useState(null);
  //refresh activity/tokens on CRUD action

  // Load journals user has access to on mount
  useEffect(() => {
    const journals = localStorage.getItem("journals");

    if (journals) {
      setJournals(JSON.parse(journals));
    }
  }, []);

  // Setter functions for search and filters
  const updateSearchTerm = (term) => {
    setSearchAndFilters({
      ...searchAndFilters,
      term: term,
    });
  };

  const updateFilters = ({ tags, moods, dates }) => {
    setSearchAndFilters({
      ...searchAndFilters,
      tags: tags,
      moods: moods,
      dates: dates,
    });
  };

  const updateSort = (sortOption) => {
    setSearchAndFilters({
      ...searchAndFilters,
      sort: sortOption,
    });
  };

  const updatePage = (pageNum) => {
    setSearchAndFilters({
      ...searchAndFilters,
      page: pageNum,
    });
  };

  const addJournal = async (journal) => {
    try {
      setIsLoading(true);
      const data = await journalsService.createJournal(journal);
      setIsLoading(false);
      // get all journals to show updated one?

      return { success: true, data: data };
    } catch (error) {
      setError(error.response?.data?.error || "Add journal failed");
      return {
        success: false,
        error: error.response?.data?.error || "Add journal failed",
      };
    }
  };

  const showAllJournals = async (params) => {
    try {
      setIsLoading(true);
      const data = await journalsService.getAllJournals(params);
      setIsLoading(false);
      const paginationValues = {
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalJournals: data.totalJournals,
      };

      setPagination(paginationValues);
      setJournals(data.journals);

      return { success: true };
    } catch (error) {
      setError(error.response?.data?.error || "showAllJournals failed");
      return {
        success: false,
        error: error.response?.data?.error || "showAllJournals failed",
      };
    }
  };

  const editJournal = async (id, updatedJournal) => {
    try {
      setIsLoading(true);
      const data = await journalsService.updateJournal(id, updatedJournal);
      setIsLoading(false);
      // return updated journals?
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.error || "Edit journal failed");
      return {
        success: false,
        error: error.response?.data?.error || "Edit journal failed",
      };
    }
  };

  const removeJournal = async (id) => {
    try {
      setIsLoading(true);
      const data = await journalsService.deleteJournal(id);
      // journal deleted - filter current list or fetch updated list?
      await journalsService.getAllJournals();
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.error || "Delete journal failed");
      return {
        success: false,
        error: error.response?.data?.error || "Delete journal failed",
      };
    }
  };

  const value = {
    view,
    journals,
    searchAndFilters,
    pagination,
    isLoading,
    error,
    token,
    addJournal,
    showAllJournals,
    editJournal,
    removeJournal,
  };

  return (
    <JournalsContext.Provider value={value}>
      {children}
    </JournalsContext.Provider>
  );
};

export const useJournals = () => {
  const context = useContext(JournalsContext);
  if (!context) {
    throw new Error("useJournals must be used within an JournalsProvider");
  }
  return context;
};
