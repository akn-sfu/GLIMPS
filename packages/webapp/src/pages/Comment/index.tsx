import React from 'react';
import CommentList from './CommentList';
import ScrollToTop from '../../shared/components/ScrollToTop';
import DefaultPageLayout from '../../shared/components/DefaultPageLayout';

const CommentPage: React.FC = () => {
  return (
    <DefaultPageLayout>
      <div>
        <ScrollToTop />
        <CommentList />
      </div>
    </DefaultPageLayout>
  );
};

export default CommentPage;
