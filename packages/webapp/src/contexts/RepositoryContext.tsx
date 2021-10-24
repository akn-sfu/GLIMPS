import React, { useContext, useEffect, useState } from 'react';

interface RepositoryContextState {
  repositoryId: string;
  setRepositoryId: React.Dispatch<React.SetStateAction<string>>;
}
export const REPOSITORY_LOCAL_STORAGE_KEY = 'repository_context';

const repositoryContextDefault: RepositoryContextState = {
  repositoryId: '',
  setRepositoryId: () => null,
};

const RepositoryContext = React.createContext<RepositoryContextState>(
  repositoryContextDefault,
);

export function useRepositoryContext() {
  return useContext(RepositoryContext);
}

function useRepositoryState(): RepositoryContextState {
  const [repositoryId, setRepositoryId] = useState<string>(
    sessionStorage.getItem(REPOSITORY_LOCAL_STORAGE_KEY),
  );
  return { repositoryId, setRepositoryId };
}

export const RepositoryContextProvider: React.FC = ({ children }) => {
  const { repositoryId, setRepositoryId } = useRepositoryState();
  useEffect(() => {
    sessionStorage.setItem(REPOSITORY_LOCAL_STORAGE_KEY, repositoryId);
  }, [repositoryId]);
  return (
    <RepositoryContext.Provider value={{ repositoryId, setRepositoryId }}>
      {children}
    </RepositoryContext.Provider>
  );
};

export function resetContextStorage() {
  sessionStorage.setItem(REPOSITORY_LOCAL_STORAGE_KEY, '');
}
