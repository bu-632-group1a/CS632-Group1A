# CS632-Group1A
Group Project

## Project Name
EcoPulse

## Elevator Pitch
EcoPulse is a web app that boosts conference engagement with custom schedules, live discussions, and sustainability tracking for real-time insights and impact.

## Inspiration
This project was initiated at the request of Dr. Vijay Kanabar, Professor at Boston University, to showcase how institutional events can be made more sustainable through digital tracking. On average, a mid-sized university event generates approximately 2,500 printed pages, 500 single-use plastic items, and over 100 pounds of food waste. By digitizing event materials and enabling real-time tracking of sustainability metrics, the app is expected to reduce paper usage by up to 90%, cut plastic waste by 60%, and help institutions implement food waste monitoring strategies.

## What it does

The proposed event management and sustainability application aims to significantly reduce waste generated at events and provide actionable insights into environmental impact.

The app is a responsive, cross-platform event companion designed to enhance the attendee and organizer experience at conferences. It allows attendees to build and sync personalized agendas, check in to sessions via QR code, and engage through interactive features like discussion boards, gamified sustainability tracking, and a conference-themed Bingo game. Users can log eco-friendly actions to earn points and view their rankings on a live sustainability leaderboard.

For organizers and speakers, the app provides real-time insights into session attendance and engagement, along with dynamic content management tools to update session details, speaker bios, and venue logistics. Speakers can independently manage and upload their own content. A secure sign-in system ensures user data protection, while optional event RSVP capabilities help manage post-conference social gatherings.

## How we built it

We will build the app as a responsive web application using React to ensure a seamless experience across mobile, tablet, and desktop devices. The frontend will use React Router for navigation, CSS for rapid and consistent styling, and context-based state management to sync user interactions like agenda building and QR code check-ins in real time.

Authentication is handled with JWT-based secure sign-in, with OpenID Connect based authentication, including token timeouts to ensure data privacy. For backend services, we will use Node.js with Express and GraphQL with MongoDB for scalable data storage, including user profiles, session info, sustainability logs, and discussion threads. Real-time features like live check-in counts and leaderboards are powered by WebSocket based frameworks and include periodic polling.

Key features like QR scanning are built using native Web APIs, allowing camera access directly from the browser. For offline access and caching, we implemented service workers and IndexedDB, ensuring critical data like agendas and speaker details are accessible without a connection.

Events are managed under a tenant administrator account, in the multi-tenant architecture design. Admin and speaker tools are built with role-based access control, allowing real-time content updates and session management. We will also incorporate gamification logic for the Bingo board and sustainability tracking using a point system tied to user actions.

The app was deployed using Vercel for frontend hosting and Render for backend services, with CI/CD pipelines to enable fast iteration and updates throughout development.

## Challenges we ran into

Challenges We Ran Into
One of the biggest challenges was ensuring a fully responsive UI that felt natural on both mobile and desktop devices. Designing a single layout that adapts well to various screen sizes, while maintaining clarity and usability—especially for first-time attendees—required multiple iterations and user testing.

Implementing real-time features like session check-ins, live attendance dashboards, and the sustainability leaderboard brought performance and data consistency challenges. We had to balance real-time updates with backend load, eventually opting for WebSocket connections where low-latency updates were critical and fallback polling for less frequent refreshes.

Building the QR code scanner entirely within the browser also posed obstacles, particularly around camera permissions and browser compatibility. We had to test and optimize across several devices and OS versions to ensure a smooth scan-and-confirm flow.

Another area that demanded careful consideration was offline support. Attendees needed access to their agenda and session info in low-connectivity areas, so we integrated service workers and local caching—which introduced complexity in syncing changes once users came back online.

From a backend perspective, supporting role-based content management (for admins, organizers, speakers, and attendees) required a robust and secure permissions model. Ensuring each user only had access to the right data was critical to prevent accidental or unauthorized changes.

Finally, we encountered UX challenges while designing the gamified features, like the Bingo board and sustainability tracker. We had to make them fun and engaging without distracting from the core event experience, which meant fine-tuning feedback loops and reward systems through iterative design.

## Accomplishments that we're proud of

Accomplishments That We're Proud Of
We’re proud of building a feature-rich, user-friendly event app that not only enhances the attendee experience but also empowers organizers and speakers with real-time tools and insights. Most importantly, we successfully integrated sustainability as a core pillar of the event experience.

Cross-Device Experience: We delivered a responsive web app that works seamlessly across mobile phones, tablets, and desktops—making it accessible to users of all technical levels.

- Real-Time QR Check-In and Analytics: Our fully functional QR code check-in system provided instant feedback for attendees while delivering real-time attendance data to organizers.
- Personalized, Syncing Agendas: Attendees were able to create and access custom schedules from any device, ensuring a highly personalized and coordinated event experience.
- Sustainability-Centered Engagement: We integrated sustainability into the heart of the app with features like an eco-action tracker, a real-time sustainability leaderboard, and a gamified Bingo board. These tools encouraged attendees to adopt environmentally conscious behaviors—such as choosing vegetarian meals and using reusable bottles—and created a visible, motivating way to track and reward impact.
- Robust Role-Based Access System: Speakers and organizers had secure tools to manage their own sessions and content, allowing for real-time updates without administrative bottlenecks.
- Beginner-Friendly UX: With clearly labeled actions, helpful tooltips, and intuitive navigation, the app was designed to be welcoming to first-time attendees and non-technical users alike.
- What sets this app apart is how it weaves sustainability, usability, and engagement into one cohesive platform—helping events not only run smoother but also make a measurable difference.

## What we learned
- Building this app taught us valuable lessons about designing for real people, scaling for real-time needs, and embedding meaningful impact into digital experiences.
- User-Centered Design Is Everything: Designing for first-time attendees and non-technical users forced us to prioritize simplicity, clarity, and ease of use. We learned that even small UX touches—like tooltips and intuitive icons—can dramatically improve onboarding and engagement.
- Sustainability Can Be Digital and Fun: By turning eco-friendly behaviors into trackable, gamified actions, we saw firsthand how digital tools can encourage real-world impact. We learned that sustainability isn’t just a checkbox—it can be a core engagement driver when approached creatively.
- Cross-Device Development Requires More Than Just Responsive Design: Supporting mobile, tablet, and desktop meant accounting for different usage patterns, browser limitations, and input methods. Testing early and often across devices was key.
- Real-Time Systems Are Powerful—but Tricky: Implementing features like live attendance tracking and dynamic leaderboards showed us the complexity of balancing real-time updates with system performance and reliability. We gained experience using WebSockets, fallback polling, and caching strategies to deliver smooth results.
- Offline Support Isn’t Optional for Events: Conference centers often have spotty Wi-Fi, so we learned the value of building offline-first features—especially for agendas and speaker content. Service workers and local storage became essential parts of our toolkit.
- Collaboration Between Roles Is Crucial: Designing features for attendees, organizers, and speakers helped us appreciate the importance of clear role-based flows and permissions. A flexible access model reduces overhead and empowers each stakeholder.

Overall, we walked away with a deeper understanding of how to build apps that are not only functional and scalable—but also inclusive, mission-driven, and genuinely helpful in live environments.

## What's next for 6635-EcoPulse

- 6635-EcoPulse started as a conference companion app, but we see huge potential to evolve it into a platform that transforms event experiences with purpose-driven technology. Here's what's next:
- Deeper Sustainability Integrations

We'll expand our eco-action tracking to include integrations with venue systems, like digital badge scans at recycling stations or transit check-ins, for even more accurate impact measurement.

- Post-Event Impact Reports
Attendees and organizers will receive personalized sustainability summaries—highlighting individual and collective actions taken, CO₂ impact equivalents, and engagement trends.

- Enhanced Gamification & Rewards
We plan to introduce achievement badges, tiered rewards, and team-based challenges to foster community engagement and friendly competition around sustainability and networking.

- Multi-Event & Multi-Tenant Support
We're building out tenant-aware architecture so that EcoPulse can power multiple events across organizations, with isolated data and branding while reusing the core platform.

- Native Mobile App
While our responsive web app serves well, a native mobile version will improve performance, enable richer offline capabilities, and allow push notifications for agenda reminders or sustainability streaks.

- AI-Powered Recommendations
We'll integrate AI to suggest sessions based on attendee interests and behaviors, and to nudge users toward sustainable choices based on their engagement patterns.

- Open Data for Organizers
Organizers will get access to exportable sustainability and engagement analytics, helping them plan greener, more impactful future events.

Ultimately, EcoPulse aims to redefine what it means to participate in an event—where being informed, engaged, and eco-conscious are all part of one smart, connected experience.

## User Stories

1. Cross-Device Access
 As an attendee, I want to access the app on both my phone and laptop so that I can stay informed regardless of the device I’m using.
 Context: The app must be fully functional on both mobile and desktop browsers.
 Prompt: Create a responsive layout using React Web that supports mobile and desktop views for attendee dashboards.

2. Custom Agenda Builder
 As an attendee, I want to build a custom agenda from the session list so I can focus on sessions that matter most to me.
 Context: Users can browse sessions and build a schedule that syncs across devices.
 Prompt: Build an authenticated agenda builder where attendees can select sessions, save them to their profile, and view a personalized agenda list.

3. QR Code Check-In
 As an attendee, I want to scan a QR code at the session entrance so that my attendance is logged easily.
 Context: Attendees check in by scanning QR codes at session doors.
 Prompt: Develop a QR scanner component that logs session ID, user ID, and timestamp upon scan, and displays a green checkmark for confirmation.

4. Sustainability Action Tracker
 As a sustainability-conscious attendee, I want to log eco-friendly actions during the event so I can track my contributions to sustainability.
 Context: Track actions like selecting vegetarian meals or using reusable bottles.
 Prompt: Create a form for logging eco-friendly actions. Save each entry with a timestamp and action type, and update the user's sustainability score accordingly.

5. Session Discussion Board
 As an attendee, I want to join discussions related to sessions I attend so I can share insights and ask questions.
 Context: Each session has a dedicated discussion board.
 Prompt: Build a threaded discussion board linked to each session ID. Allow users to post, reply, and upvote comments.

6. Sustainability Leaderboard
 As an attendee, I want to compare my sustainability score to others so I stay motivated to engage more.
 Context: Users want to see how they rank in eco-friendly engagement.
 Prompt: Create a leaderboard that ranks users by sustainability score. Ensure real-time updates of rankings.

7. Beginner-Friendly UI
 As a first-time attendee, I want the app to be intuitive so I can quickly learn how to use it without help.
 Context: The app must be easy for non-technical users.
 Prompt: Design a simplified dashboard with tooltips and clearly labeled actions (e.g., bookmark, check-in) to guide new users.

8. Session Bookmark Insights
 As an organizer, I want to know which sessions are being bookmarked most often so I can plan room assignments accordingly.
 Context: Helps predict attendance and avoid overbooking.
 Prompt: Create an admin dashboard widget that displays the top 10 most-bookmarked sessions with titles and counts.

9. Real-Time Attendance
 As an organizer, I want to access real-time session attendance data so I can track engagement.
 Context: Requires instant feedback from check-in scans.
 Prompt: Display real-time check-in counts per session in the admin panel using live API polling or WebSockets.

10. Real-Time Content Management
 As an organizer, I want to upload and update session content, speaker bios, and logistics at any time.
 Context: Enables dynamic content management.
 Prompt: Build a content management interface for admins to create, edit, and delete sessions, speaker info, and venue logistics.

11. Speaker Content Control
 As a speaker, I want to edit my session details and upload files before the event.
 Context: Empower speakers to manage their own content.
 Prompt: Create a session editor for speakers to update titles, descriptions, and upload presentation files.

12. Gamified Bingo Board
 As an attendee, I want to complete a conference-themed Bingo board so I can connect with others and earn rewards.
 Context: A Bingo board will gamify sustainability and social engagement.
 Prompt: Design an interactive Bingo board with tappable squares. Track user progress, award bonus points for completed rows, and link with the sustainability badge system.

13. Secure Sign-In
As a user, I want to sign in securely using my email and password so that I can access my personalized content.
Context: The app needs secure, user-authenticated sessions.
Prompt: Implement a secure login system with JWT-based authentication and hashed passwords. Include error handling and session timeouts.

14. RSVP to BU Pub Event
As an attendee, I want to RSVP to the BU Pub event after the conference so that I can confirm my attendance and receive details.
Context: Attendees should be able to register interest in the optional social gathering.
Prompt: Create an RSVP form for the BU Pub event. Collect user ID, contact info, and any dietary preferences. Send confirmation upon submission.
