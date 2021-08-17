import React from 'react';
import DynamicGraph from '../../components/DynamicGraph';
import DefaultPageLayout from '../../shared/DefaultPageLayout';

const Graph: React.FC = () => {
  return (
    <DefaultPageLayout>
      <div>
        <DynamicGraph />
      </div>
    </DefaultPageLayout>
  );
};

export default Graph;
