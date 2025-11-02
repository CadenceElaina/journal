import React, { createContext, useContext, useEffect, useState } from "react";
import journalsService from "../../../services/journals";
import { useAuth } from "../../auth/context/AuthContext";

const JournalsContext = createContext(null);

const VIEWS = {
  MY_JOURNALS: "myJournals",
  SHARED_JOURNALS: "sharedJournals",
};

export const JournalsProvider = ({ children }) => {
  const { tokens } = useAuth();

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
    limit: 10,
    isShared: false,
  });
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalJournals: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  //refresh activity/tokens on CRUD action
  // Initial fetch when token is available
  useEffect(() => {
    if (tokens?.accessToken) {
      showAllJournals(searchAndFilters);
    }
  }, [tokens?.accessToken]);

  // refetch when search/filters change
  useEffect(() => {
    if (tokens?.accessToken) {
      const delayDebounce = setTimeout(() => {
        showAllJournals(searchAndFilters);
      }, 300); // Debounce search

      return () => clearTimeout(delayDebounce);
    }
  }, [searchAndFilters]);

  // Setter functions for search and filters
  const switchView = (newView) => {
    setView(newView);
    setSearchAndFilters((prev) => ({
      ...prev,
      isShared: newView === VIEWS.SHARED_JOURNALS,
      page: 1,
    }));
  };

  const updateSearchTerm = (term) => {
    setSearchAndFilters((prev) => ({
      ...prev,
      term,
      page: 1,
    }));
  };

  const updateFilters = ({ tags, moods, startDate, endDate, date }) => {
    setSearchAndFilters((prev) => ({
      ...prev,
      tags,
      moods,
      startDate,
      endDate,
      date,
      page: 1,
    }));
  };

  const updateSort = (sortOption) => {
    setSearchAndFilters((prev) => ({
      ...prev,
      sort: sortOption,
      page: 1,
    }));
  };

  const updatePage = (pageNum) => {
    setSearchAndFilters((prev) => ({
      ...prev,
      page: pageNum,
    }));
  };

  const resetFilters = () => {
    setSearchAndFilters({
      term: "",
      tags: [],
      moods: [],
      startDate: null,
      endDate: null,
      date: null,
      sort: "",
      page: 1,
      limit: 0,
      isShared: false,
    });
  };

  const clearError = () => {
    setError(null);
  };

  // CRUD Actions

  const addJournal = async (journal) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await journalsService.createJournal(journal);

      // Add to local state immediately - optimistic update: https://stackoverflow.com/questions/33009657/what-are-optimistic-updates-in-front-end-development
      setJournals((prev) => [data, ...prev]);

      // refetech to ensure consistency
      // await showAllJournals(searchAndFilters);

      setIsLoading(false);
      return { success: true, data: data };
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.response?.data?.error || "Add journal failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const showAllJournals = async (params) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await journalsService.getAllJournals(params);

      console.log("📚 Journals loaded:", data.journals); // DEBUG

      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalJournals: data.totalJournals,
      });
      setJournals(data.journals);
      setIsLoading(false);

      return { success: true, data };
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.response?.data?.error || "showAllJournals failed";
      setError(errorMsg);
      console.error("❌ Error loading journals:", errorMsg); // DEBUG
      return { success: false, error: errorMsg };
    }
  };

  const getJournalById = async (id) => {
    try {
      setIsLoading(true);
      const data = await journalsService.getJournalById(id);
      setIsLoading(false);
      return { success: true, data };
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.response?.data?.error || "Failed to fetch journal";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const editJournal = async (id, updatedJournal) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await journalsService.updateJournal(id, updatedJournal);

      // Update local state
      setJournals(
        (prev) => prev.map((journal) => (journal.id === id ? data : journal)) // if id of existing journal matches the one we need to update - replace it with updated value else keep original
      );

      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.response?.data?.error || "Edit journal failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const removeJournal = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      await journalsService.deleteJournal(id);

      // journal deleted - filter current list or fetch updated list?
      setJournals((prev) => prev.filter((journal) => journal.id !== id)); // setJournals to be all except the one that matches our id to remove

      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.response?.data?.error || "Delete journal failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const value = {
    view,
    VIEWS,
    journals,
    searchAndFilters,
    pagination,
    isLoading,
    error,
    updateSearchTerm,
    updateFilters,
    updateSort,
    updatePage,
    switchView,
    resetFilters,
    clearError,
    showAllJournals,
    getJournalById,
    addJournal,
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
