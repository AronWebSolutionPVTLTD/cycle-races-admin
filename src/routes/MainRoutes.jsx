import { lazy } from 'react';
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import RidersPage from '../pages/rider-data/rider-list';
import RiderDetailsPage from '../pages/rider-data/rider-detail';
import RiderForm from '../pages/rider-data/create-edit-page';
import RaceList from '../pages/races-data/races-list';
import RaceDetailPage from '../pages/races-data/race-detail';
import RaceForm from '../pages/races-data/create-edit-page';
import TeamList from '../pages/team-data/team-list';
import TeamDetail from '../pages/team-data/team-detail';
import TeamForm from '../pages/team-data/create-edit';
import StageManagement from '../pages/stages-data/stages-list';
import StageDetail from '../pages/stages-data/stage-detail';
import StageForm from '../pages/stages-data/create-edit';
import RaceMerging from '../pages/merge-data/racemerging';
import TeamMerging from '../pages/merge-data/teammerging';
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

const MainRoutes = {
  path: '/',
  // element: <DashboardLayout />,
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      element: <DashboardDefault />
    },
    {
      path: 'typography',
      element: <Typography />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
      path: 'races-list',
      element: <RaceList />
    },
    {
      path: 'race/:id',
      element: <RaceDetailPage />
    },
    {
      path: 'race/create',
      element: <RaceForm mode="create" />
    },
    {
      path: 'race/:id/edit',
      element: <RaceForm mode="edit" />
    },
    {
      path: 'riders',
      element: <RidersPage />
    },
    {
      path: 'riders/:id',
      element: <RiderDetailsPage />
    },
    {
      path: 'riders/create',
      element: <RiderForm mode="create" />
    },
    {
      path: 'riders/:id/edit',
      element: <RiderForm mode="edit" />
    },
    {
      path: 'teams',
      element: <TeamList />
    },
    {
      path: 'team/:id',
      element: <TeamDetail />
    },
    {
      path: 'team/create',
      element: <TeamForm mode="create" />
    },
    {
      path: 'team/:id/edit',
      element: <TeamForm mode="edit" />
    },
    {
      path: 'stages',
      element: <StageManagement />
    },
    {
      path: 'stage/:id',
      element: <StageDetail />
    },
    {
      path: 'stage/create',
      element: <StageForm mode="create" />
    },
    {
      path: 'stage/:id/edit',
      element: <StageForm mode="edit" />
    },
    {
      path: 'racemerging',
      element: <RaceMerging />
    },
    {
      path: 'teammerging',
      element: <TeamMerging />
    },
  ]
};

export default MainRoutes;
