import React from 'react';
import DynamicGraph from './DynamicGraph';
import DefaultPageLayout from '../../shared/components/DefaultPageLayout';

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
