import React, { useContext, useEffect, useState } from 'react';
import { DateTime } from 'luxon';

interface FilterContextState {
  startDate: string;
  endDate: string;
  author: string;
  emails: string[];
  iteration: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
  setAuthor: React.Dispatch<React.SetStateAction<string>>;
  setEmail: React.Dispatch<React.SetStateAction<string[]>>;
  setIteration: React.Dispatch<React.SetStateAction<string>>;
}

const START_DATE_LOCAL_STORAGE_KEY = 'start_date_context';
const END_DATE_LOCAL_STORAGE_KEY = 'end_date_context';
const AUTHOR_LOCAL_STORAGE_KEY = 'author_context';
const EMAIL_LOCAL_STORAGE_KEY = 'emails_context';
const ITERATION_LOCAL_STORAGE_KEY = 'iteration_context';

const FilterContextDefault: FilterContextState = {
  startDate: DateTime.now().minus({ days: 7 }).toISO(),
  endDate: DateTime.now().toISO(),
  author: '',
  emails: [''],
  iteration: '',
  setStartDate: () => null,
  setEndDate: () => null,
  setEmail: () => null,
  setAuthor: () => null,
  setIteration: () => null,
};

const FilterContext = React.createContext<FilterContextState>(
  FilterContextDefault,
);

export function useFilterContext() {
  return useContext(FilterContext);
}

function useFilterState(): FilterContextState {
  const startDateValue = sessionStorage.getItem(START_DATE_LOCAL_STORAGE_KEY);
  if (!startDateValue) {
    sessionStorage.setItem(
      START_DATE_LOCAL_STORAGE_KEY,
      DateTime.now().minus({ days: 7 }).toISO(),
    );
  }
  const endDateValue = sessionStorage.getItem(END_DATE_LOCAL_STORAGE_KEY);
  if (!endDateValue) {
    sessionStorage.setItem(END_DATE_LOCAL_STORAGE_KEY, DateTime.now().toISO());
  }
  const authorValue = sessionStorage.getItem(AUTHOR_LOCAL_STORAGE_KEY);
  if (!authorValue) {
    sessionStorage.setItem(AUTHOR_LOCAL_STORAGE_KEY, 'all');
  }
  const iterationValue = sessionStorage.getItem(ITERATION_LOCAL_STORAGE_KEY);
  if (!iterationValue) {
    sessionStorage.setItem(ITERATION_LOCAL_STORAGE_KEY, 'none');
  }
  const [startDate, setStartDate] = useState<string>(
    sessionStorage.getItem(START_DATE_LOCAL_STORAGE_KEY),
  );
  const [endDate, setEndDate] = useState<string>(
    sessionStorage.getItem(END_DATE_LOCAL_STORAGE_KEY),
  );
  const [author, setAuthor] = useState<string>(
    sessionStorage.getItem(AUTHOR_LOCAL_STORAGE_KEY),
  );
  const [emails, setEmail] = useState<string[]>(
    JSON.parse(sessionStorage.getItem(EMAIL_LOCAL_STORAGE_KEY) || '[]'),
  );
  const [iteration, setIteration] = useState<string>(
    sessionStorage.getItem(ITERATION_LOCAL_STORAGE_KEY),
  );

  return {
    startDate,
    endDate,
    author,
    emails,
    iteration,
    setStartDate,
    setEndDate,
    setAuthor,
    setEmail,
    setIteration,
  };
}

export const FilterContextProvider: React.FC = ({ children }) => {
  const value = useFilterState();
  useEffect(() => {
    sessionStorage.setItem(START_DATE_LOCAL_STORAGE_KEY, value.startDate);
  }, [value.startDate]);
  useEffect(() => {
    sessionStorage.setItem(END_DATE_LOCAL_STORAGE_KEY, value.endDate);
  }, [value.endDate]);
  useEffect(() => {
    sessionStorage.setItem(AUTHOR_LOCAL_STORAGE_KEY, value.author);
  }, [value.author]);
  useEffect(() => {
    sessionStorage.setItem(
      EMAIL_LOCAL_STORAGE_KEY,
      JSON.stringify(value.emails),
    );
  }, [value.emails]);
  useEffect(() => {
    sessionStorage.setItem(ITERATION_LOCAL_STORAGE_KEY, value.iteration);
  }, [value.iteration]);
  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

export function resetFilterStorage() {
  sessionStorage.setItem(
    START_DATE_LOCAL_STORAGE_KEY,
    DateTime.now().minus({ days: 7 }).toISO(),
  );
  sessionStorage.setItem(END_DATE_LOCAL_STORAGE_KEY, DateTime.now().toISO());
  sessionStorage.setItem(AUTHOR_LOCAL_STORAGE_KEY, 'all');
  sessionStorage.setItem(ITERATION_LOCAL_STORAGE_KEY, 'none');
}
