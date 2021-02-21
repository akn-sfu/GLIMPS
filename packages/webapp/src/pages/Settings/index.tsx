import React, { useEffect } from 'react';
import DefaultPageLayout from '../../components/DefaultPageLayout';
import SettingsForm from '../../components/SettingsForm';
import { useRepositoryContext } from '../../contexts/RepositoryContext';

const SettingsPage: React.FC = () => {
  const { setRepositoryId } = useRepositoryContext();
  useEffect(() => {
    setRepositoryId('');
  });
  return (
    <div>
      <DefaultPageLayout>
        <SettingsForm />
      </DefaultPageLayout>
    </div>
  );
};

export default SettingsPage;
