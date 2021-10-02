import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import RepositoryPage from '../../pages/Repositories';
import Login from '../../pages/Login';
import OperationsPage from '../../pages/Operations';
import BrowseScoringConfigsPage from '../../pages/GlobalSettings/ScoreConfig';
import EditScoringConfigPage from '../../pages/GlobalSettings/ScoreConfig/EditScoringConfigPage';
import BrowseGroupConfigPage from '../../pages/GlobalSettings/IterationConfig';
import EditGroupConfigPage from '../../pages/GlobalSettings/IterationConfig/Edit';
import SfuVerify from '../../pages/Login/SfuVerify';
import Graph from '../../pages/Graph';
import ListMergeRequestPage from '../../pages/Code';
import ApiSettingPage from '../../pages/GlobalSettings/ApiSetting';
import SettingsPage from '../../pages/GlobalSettings';
import { useAuthContext } from '../../contexts/AuthContext';
import RepoSetupPage from '../../pages/RepositorySetup';
import { RepositoryScoringContextProvider } from '../../pages/RepositorySetup/ScoringConfig/RepositoryScoringContext';
import CommentPage from '../../pages/Comment';

export function Router() {
  const { user } = useAuthContext();
  console.log(user);
  return (
    <BrowserRouter>
      <Switch>
        <Route path='/' exact>
          {user?.id ? <Redirect to='/repository' /> : <Login />}
        </Route>
        <Route path='/sfu' exact>
          <SfuVerify />
        </Route>
        <PrivateRoute path='/repository' exact>
          <RepositoryPage />
        </PrivateRoute>
        <PrivateRoute path='/setup/:id' exact>
          <RepositoryScoringContextProvider>
            <RepoSetupPage />
          </RepositoryScoringContextProvider>
        </PrivateRoute>
        <PrivateRoute path='/graph/:id' exact>
          <Graph />
        </PrivateRoute>
        <PrivateRoute path='/comment/:id' exact>
          <CommentPage />
        </PrivateRoute>
        <PrivateRoute path='/settings' exact>
          <SettingsPage />
        </PrivateRoute>
        <PrivateRoute path='/settings/api' exact>
          <ApiSettingPage />
        </PrivateRoute>
        <PrivateRoute path='/settings/scoring' exact>
          <BrowseScoringConfigsPage />
        </PrivateRoute>
        <PrivateRoute path='/settings/group' exact>
          <BrowseGroupConfigPage />
        </PrivateRoute>
        <PrivateRoute path='/merge/:id' exact>
          <ListMergeRequestPage />
        </PrivateRoute>
        <PrivateRoute path='/operations' exact>
          <OperationsPage />
        </PrivateRoute>
        <PrivateRoute path='/settings/scoring/edit' exact>
          <EditScoringConfigPage />
        </PrivateRoute>
        <PrivateRoute path='/settings/group/edit' exact>
          <EditGroupConfigPage />
        </PrivateRoute>
        <Route path='/logout' exact>
          <Login />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

function PrivateRoute({ children, ...rest }) {
  const { user } = useAuthContext();
  return <Route {...rest}>{user?.id ? children : <Login />}</Route>;
}
