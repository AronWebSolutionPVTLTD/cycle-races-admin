import { ChromeOutlined, QuestionOutlined, OrderedListOutlined } from '@ant-design/icons';
const icons = {
  ChromeOutlined,
  QuestionOutlined,
  OrderedListOutlined
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
      icon: icons.OrderedListOutlined
    },
    {
      id: 'riders',
      title: 'Riders Management',
      type: 'item',
      url: '/riders',
      icon: icons.OrderedListOutlined
    },
    {
      id: 'teams',
      title: 'Team Management',
      type: 'item',
      url: '/teams',
      icon: icons.OrderedListOutlined
    },
    {
      id: 'stages',
      title: 'Stages Management',
      type: 'item',
      url: '/stages',
      icon: icons.OrderedListOutlined
    },

    {
      id: 'racemerging',
      title: 'Race Merging',
      type: 'item',
      url: '/racemerging',
      icon: icons.ChromeOutlined
    },
    {
      id: 'teammerging',
      title: 'Team Merging',
      type: 'item',
      url: '/teammerging',
      icon: icons.ChromeOutlined
    },
  
  ]
};

export default support;
