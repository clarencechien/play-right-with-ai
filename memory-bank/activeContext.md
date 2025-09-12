# Active Context: Play right with AI Workshop

## Current Work Focus
- Workshop 100% complete and production-ready
- All components finished, tested, and documented
- GitHub Pages live at https://clarencechien.github.io/play-right-with-ai/
- Clean codebase with organized structure

## Recent Changes
1. Completed all workshop materials (8 chapters, 4 apps, 40+ prompts)
2. Fixed all routing and CSS issues in static site
3. Added comprehensive launch materials and documentation
4. Implemented privacy-first Google Analytics
5. Cleaned up project structure - removed bloat, organized files
6. Created PROJECT_STRUCTURE.md for clear documentation
7. Removed all GPT version references (GPT-4 → GPT) for version agnosticism
8. **UPDATED**: Refactored docs/next-step.md to focus on content architecture and single source of truth
9. **NEW**: Identified critical content duplication issues across three locations
10. **NEW**: Designed content pipeline architecture for automated synchronization

## Next Steps

### Immediate (Sprint 1: Days 1-3)
1. Create `/content/` directory structure for single source of truth
2. Migrate first chapter as proof of concept
3. Build basic content generation script
4. Set up test framework with TDD approach

### Short-term (Sprint 2: Days 4-7)
1. Migrate all 8 chapters to single source
2. Create metadata files for each chapter
3. Standardize all content formats
4. Update memory bank documentation

### Medium-term (Sprint 3: Days 8-10)
1. Implement link validation system
2. Create CI/CD pipeline for content
3. Add content watching for development
4. Complete test coverage for all scripts

## Active Decisions and Considerations

### Technical Decisions
- **Vanilla JS First**: Start with pure JavaScript before frameworks
- **MCP Integration**: Focus on Playwright MCP for browser automation
- **Multi-Model Support**: Ensure prompts work with Claude, GPT, Gemini

### Content Decisions
- **Language Balance**: 30-70% English thinking based on complexity
- **Exercise Difficulty**: Progressive from guided to independent
- **Assessment Method**: Self-check questions + capstone project

### Community Decisions
- **Contribution Model**: Accept prompt improvements via PR
- **Support Channels**: GitHub Issues for bugs, Discussions for learning
- **Success Tracking**: Stars, forks, completion rates

## Current Blockers
- Content exists in three separate locations with no sync mechanism
- GitHub repository link is broken (placeholder value)
- Google Analytics ID not configured
- No automated link validation

## Questions to Resolve
1. Should we provide API key sponsorship for learners?
2. How to handle version updates of AI models?
3. Best way to track learner progress?
4. Should we create video supplements?
5. **NEW**: Which markdown processor to use (markdown-it vs remark)?
6. **NEW**: Should we version content separately from code?

## Resources Needed
1. Test environment for workshop validation
2. Community moderators post-launch
3. Translation review for technical accuracy
4. Performance benchmarks for prompts

## Risk Considerations
1. **AI Model Changes**: Prompts may need updates
2. **API Costs**: Learners need budget for AI services
3. **Language Barriers**: Balancing technical English with Chinese
4. **Maintenance**: Keeping content current with tool updates