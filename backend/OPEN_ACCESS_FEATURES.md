# Open-Access Profile Features

## 🎯 Overview

SciConnect now supports open-access profiles that allow users to self-identify and showcase their work regardless of institutional affiliation. This promotes inclusivity and recognizes the value of citizen science, DIY projects, and independent research.

## ✨ New Features

### 1. User Type Badges

Users can now identify themselves with one of five categories:

- **Academic** - University researchers and faculty members
- **Hobbyist** - Science enthusiasts pursuing knowledge for fun
- **Independent** - Self-directed researchers or practitioners
- **Student** - Currently studying or in training
- **Professional** - Industry or applied science professionals

Each badge has a unique color scheme and icon to help users quickly identify each other's background and approach.

### 2. Skill & Interest Tags

Users can add comprehensive skill tags that go beyond traditional academic credentials:

- **Technical Skills**: Python, JavaScript, R, SQL, Git, Docker
- **Scientific Fields**: Biology, Chemistry, Physics, Data Science, AI/ML
- **Specialized Areas**: Bioinformatics, Genomics, DIY Biology, Citizen Science
- **Soft Skills**: Scientific Writing, Teaching, Mentoring, Collaboration

Features:
- Autocomplete suggestions from a curated list
- Custom tag creation
- Visual tag display with icons
- Easy tag management (add/remove)

### 3. Side Projects & Experiments

Users can showcase their informal work and experiments:

- **Project Title** - Name of the project or experiment
- **Description** - Detailed explanation of the work
- **URL** - Link to project repository, documentation, or results
- **Technologies** - Skills and tools used in the project

This feature highlights:
- DIY biology kits
- Citizen science contributions
- Open-source projects
- Informal research and experiments
- Educational initiatives

## 🛠️ Technical Implementation

### Database Changes

New fields added to the `Users` table:

```sql
-- User type classification
userType ENUM('academic', 'hobbyist', 'independent', 'student', 'professional')

-- Skill tags (JSON array)
skillTags TEXT DEFAULT '[]'

-- Side projects (JSON array of objects)
sideProjects TEXT DEFAULT '[]'

-- Badges (JSON array)
badges TEXT DEFAULT '[]'
```

### API Endpoints

Updated profile endpoints to handle new fields:

- `GET /api/profile/:userId` - Returns user profile with new fields
- `PUT /api/profile` - Updates profile including new fields

### Frontend Components

New React components created:

- `UserBadge.jsx` - Displays user type badges with tooltips
- `SkillTagManager.jsx` - Manages skill tags with autocomplete
- `SideProjectManager.jsx` - Manages side projects with forms

## 🎨 User Experience

### Profile Display

1. **User Type Badge** - Prominently displayed below the user's name
2. **Skills Section** - Visual tags with icons showing expertise
3. **Side Projects** - Detailed cards showing informal work
4. **Traditional Sections** - Education, publications, research interests

### Profile Editing

Enhanced edit form includes:

1. **User Type Selection** - Dropdown to choose identity
2. **Skill Tag Manager** - Interactive tag input with suggestions
3. **Side Project Manager** - Form-based project creation
4. **Existing Fields** - All previous profile fields maintained

## 🔧 Setup Instructions

### 1. Database Migration

Run the database sync to add new fields:

```bash
node -e "const sequelize = require('./db'); sequelize.sync({ alter: true })"
```

### 2. Start the Application

```bash
# Start backend server
npm start

# Start frontend (in another terminal)
cd frontend && npm run dev
```

### 3. Test the Features

1. Open http://localhost:5173
2. Log in or create an account
3. Go to your profile
4. Click "Edit Profile"
5. Try adding skills, side projects, and changing your user type
6. Create a post and test the comment functionality

## 🐛 Bug Fixes

### Comment Functionality

Fixed the comment system by adding missing database fields:

- Added `postId` field to Comments table
- Added `userId` field to Comments table
- Updated Comment model associations

The comment button should now work correctly when creating and replying to comments.

## 🎯 Benefits

### For Users

- **Inclusive Identity** - No institutional email required
- **Skill Recognition** - Showcase practical abilities beyond degrees
- **Project Visibility** - Highlight informal and experimental work
- **Community Building** - Connect with like-minded researchers

### For the Platform

- **Diverse Community** - Attract hobbyists, independent researchers, and citizen scientists
- **Rich Profiles** - More comprehensive user information for better matching
- **Content Discovery** - Surface work by topic rather than institutional prestige
- **Innovation Showcase** - Highlight cutting-edge DIY and citizen science projects

## 🚀 Future Enhancements

Potential additions:

- **Badge System** - Earnable badges for contributions and achievements
- **Project Collaboration** - Connect users working on similar projects
- **Skill Matching** - Algorithm to suggest connections based on skills
- **Project Funding** - Support for crowdfunding citizen science projects
- **Event Integration** - Connect with local science meetups and hackathons

## 📝 Usage Examples

### Hobbyist Profile Example

```json
{
  "userType": "hobbyist",
  "skillTags": ["DIY Biology", "Arduino", "3D Printing", "Microscopy"],
  "sideProjects": [
    {
      "title": "Home Microscope Upgrade",
      "description": "Modified a basic microscope with LED lighting and camera attachment",
      "url": "https://github.com/user/microscope-hack",
      "technologies": ["Arduino", "3D Printing", "Electronics"]
    }
  ]
}
```

### Independent Researcher Example

```json
{
  "userType": "independent",
  "skillTags": ["Data Science", "Python", "Machine Learning", "Open Source"],
  "sideProjects": [
    {
      "title": "Citizen Science Data Analysis",
      "description": "Analyzing public datasets to identify climate change patterns",
      "url": "https://github.com/user/climate-analysis",
      "technologies": ["Python", "Pandas", "Matplotlib", "Jupyter"]
    }
  ]
}
```

This implementation creates a more inclusive and comprehensive platform that values all forms of scientific contribution, from formal academic research to innovative DIY projects and citizen science initiatives. 