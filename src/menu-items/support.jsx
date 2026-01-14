import { ChromeOutlined, QuestionOutlined, OrderedListOutlined,FlagOutlined,IdcardOutlined,TeamOutlined,PartitionOutlined,SwapOutlined } from '@ant-design/icons';
const icons = {
  ChromeOutlined,
  QuestionOutlined,
  OrderedListOutlined,
  FlagOutlined,
  IdcardOutlined,
  TeamOutlined,
  PartitionOutlined,
  SwapOutlined
};

const support = {
  id: 'support',
  title: 'Management',
  type: 'group',
  children: [
    {
      id: 'races-list',
      title: 'Race Management',
      type: 'item',
      url: '/races-list',
      icon: icons.FlagOutlined
    },
    {
      id: 'riders',
      title: 'Riders Management',
      type: 'item',
      url: '/riders',
      icon: icons.IdcardOutlined
    },
    {
      id: 'teams',
      title: 'Team Management',
      type: 'item',
      url: '/teams',
      icon: icons.TeamOutlined
    },
    {
      id: 'stages',
      title: 'Stages Management',
      type: 'item',
      url: '/stages',
      icon: icons.PartitionOutlined
    },

    {
      id: 'racemerging',
      title: 'Race Merging',
      type: 'item',
      url: '/racemerging',
      icon: icons.SwapOutlined
    },
    {
      id: 'teammerging',
      title: 'Team Merging',
      type: 'item',
      url: '/teammerging',
      icon: icons.SwapOutlined
    },
  
  ]
};

export default support;
