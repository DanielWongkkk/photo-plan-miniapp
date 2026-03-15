# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 待开发功能...

---

## [0.3.0] - 2026-03-16

### Added
- **AI Weekly Recommendations**: AI-generated photography themes based on season, holidays, and trends
- **Homepage Swiper**: Carousel display of weekly hot recommendations
- **Recommendation History**: Browse all past weekly recommendations grouped by week
- **One-click Fill**: Tap recommendation to auto-fill the form
- **Seasonal Awareness**: Recommendations automatically adjust based on current season and month

### Changed
- **Homepage UI Redesign**: Added recommendation section above the form
- **Better User Guidance**: Clearer prompts when no idea what to shoot

### Technical
- Added `RecommendationService` for AI-powered theme generation
- Added `/api/recommendations` routes (weekly, history, generate)
- Recommendations cached locally for 24 hours
- Fallback to season-based default recommendations when AI unavailable

### Commits
- `452334f` feat: 添加 AI 每周推荐功能

---

## [0.2.0] - 2026-03-16

### Added
- **Weather-driven date recommendation**: Integrated Open-Meteo API for 5-day weather forecast with shooting suitability scores
- **Specific shooting spots with navigation**: Each spot includes name, address, coordinates; supports Tencent/Gaode/Baidu/WeChat map navigation
- **Sample photo source attribution**: Each sample labeled with platform (Xiaohongshu/Instagram/500px/Tuchong) and author
- **Portrait pose guidance**: Detailed posing instructions for each shooting spot in portrait photography
- **Time slot light analysis**: Recommends golden hour/blue hour with light condition descriptions
- **Shot list checkoff**: Mark items as completed with local progress persistence
- **Post-processing guide**: Detailed color grading steps and preset recommendations

### Changed
- **Result page UI restructured**: Clearer information hierarchy with expandable sections
- **Improved AI prompts**: More specific shooting spot information generation

### Technical
- Added `PlanService` class for unified plan generation logic
- Integrated Open-Meteo weather API (free, no API key required)
- Added weather code to description mapping for Chinese users

### Commits
- `fa53fb9` feat: 优化结果页，增强策划可行性
- `433f059` docs: 添加项目文档
- `095a3f9` feat: 完成后端 API 框架
- `e3d4946` feat: 完成个人中心页面
- `23a7ce8` feat: 完成加载和结果页面
- `51abe67` feat: 完成首页输入表单
- `2a63ad3` feat: 完成登录页面
- `e20c5d5` feat: 初始化项目结构

---

## [0.1.0] - 2026-03-15

### Added
- **Project initialization**: WeChat mini-program framework setup
- **Login page**: WeChat one-click login, avatar and nickname settings
- **Home page**: Input form for theme/location/time/equipment
- **Loading page**: Generation animation effects
- **Result page**: Basic plan display
- **Profile page**: User info and equipment management entry
- **Backend API**: Express framework with auth/plan/user routes

### Technical
- Frontend: WeChat mini-program native framework
- Backend: Node.js + Express
- AI: Multi-model support (Qwen/DeepSeek/GLM)

---

## Version Naming Convention

- **Major (X.0.0)**: Breaking changes, major feature releases
- **Minor (0.X.0)**: New features, backward compatible
- **Patch (0.0.X)**: Bug fixes, minor improvements

[Unreleased]: https://github.com/DanielWongkkk/photo-plan-miniapp/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/DanielWongkkk/photo-plan-miniapp/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/DanielWongkkk/photo-plan-miniapp/releases/tag/v0.1.0