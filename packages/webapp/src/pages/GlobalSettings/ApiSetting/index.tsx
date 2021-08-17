import React from 'react';
import DefaultPageLayout from '../../../shared/DefaultPageLayout';
import SettingsForm from './SettingsForm';

const ApiSettingPage: React.FC = () => {
  return (
    <div>
      <DefaultPageLayout>
        <SettingsForm />
      </DefaultPageLayout>
    </div>
  );
};

export default ApiSettingPage;
