// assets
import { ChromeOutlined, QuestionOutlined, OrderedListOutlined } from '@ant-design/icons';

// icons
const icons = {
  ChromeOutlined,
  QuestionOutlined,
  OrderedListOutlined
};

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const support = {
  id: 'support',
  title: 'Support',
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
    }

    // {
    //   id: 'sample-page',
    //   title: 'Sample Page',
    //   type: 'item',
    //   url: '/sample-page',
    //   icon: icons.ChromeOutlined
    // },
    // {
    //   id: 'documentation',
    //   title: 'Documentation',
    //   type: 'item',
    //   url: 'https://codedthemes.gitbook.io/mantis/',
    //   icon: icons.QuestionOutlined,
    //   external: true,
    //   target: true
    // }
  ]
};

export default support;
