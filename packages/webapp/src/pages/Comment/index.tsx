import React from 'react';
import CommentList from './CommentList/CommentList';
import ScrollToTop from '../../shared/ScrollToTop';
import DefaultPageLayout from '../../components/DefaultPageLayout';

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
