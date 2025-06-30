# SmartPromo Admin Dashboard

A modern, responsive, and professional admin dashboard built with Angular 18 and Tailwind CSS.

## 🎨 Features

- **Modern UI Design**: Clean, elegant interface suitable for enterprise admin panels
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between light and dark themes
- **Sidebar Navigation**: Collapsible sidebar with Font Awesome icons
- **Dashboard Analytics**: Beautiful stats cards and data visualization
- **Animated Interactions**: Smooth transitions and hover effects
- **Professional Components**: Ready-to-use components for various admin needs

## 🚀 Tech Stack

- **Angular 18**: Latest version with standalone components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Font Awesome**: Comprehensive icon library
- **TypeScript**: Type-safe development
- **RxJS**: Reactive programming for Angular

## 📱 Layout Structure

### Sidebar Navigation

- 📄 **Articles** (with submenu)
  - Categories
  - All Articles
- 🛒 **Ventes** (Sales)
- 📦 **Stock**
- 🏢 **Department**
- 🏫 **Etablissement**

### Top Navbar

- Page title
- Search bar
- Theme toggle (🌙/☀️)
- Notifications (🔔) with dropdown
- User profile (👤) with dropdown menu

### Main Content Area

- Dynamic content based on route
- Responsive grid layouts
- Interactive components
- Professional data tables

## 🎯 Key Features

### Responsive Design

- Mobile-first approach
- Breakpoint-based layouts
- Touch-friendly interface
- Adaptive sidebar (collapsible on mobile)

### Theme Support

- Light/Dark theme toggle
- Persistent theme selection
- Smooth theme transitions
- System theme detection

### Interactive Elements

- Animated sidebar toggle
- Collapsible submenus
- Hover effects
- Loading states
- Notification system

## 🛠️ Installation & Setup

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start Development Server**:

   ```bash
   ng serve
   ```

3. **Build for Production**:
   ```bash
   ng build
   ```

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── layout/
│   │       ├── main-layout/
│   │       ├── sidebar/
│   │       └── navbar/
│   ├── pages/
│   │   ├── dashboard/
│   │   ├── articles/
│   │   ├── categories/
│   │   ├── ventes/
│   │   ├── stock/
│   │   ├── department/
│   │   └── etablissement/
│   ├── app.routes.ts
│   └── app.component.ts
├── styles.css
└── assets/
```

## 🎨 Styling Guidelines

### Tailwind CSS Classes Used

- **Spacing**: `p-*`, `m-*`, `space-*`
- **Colors**: `bg-*`, `text-*`, `border-*`
- **Layout**: `flex`, `grid`, `container`
- **Responsive**: `sm:*`, `md:*`, `lg:*`, `xl:*`
- **Dark Mode**: `dark:*`

### Custom Animations

- Sidebar slide transitions
- Dropdown animations
- Hover effects
- Theme transitions

## 🔧 Configuration

### Tailwind Config

- Custom color palette
- Dark mode support
- Custom animations
- Plugin integrations

### Angular Config

- Standalone components
- Lazy loading ready
- SSR compatible
- Production optimized

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Future Enhancements

- [ ] Chart.js integration for analytics
- [ ] Advanced table components
- [ ] Form validation
- [ ] API integration
- [ ] User authentication
- [ ] Role-based access control
- [ ] Data export functionality
- [ ] Advanced search and filtering

---

Built with ❤️ using Angular 18 and Tailwind CSS
