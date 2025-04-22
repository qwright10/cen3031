<div align="center">
  <p>
    <a href="https://snapcards.org/">
      <img src="https://raw.githubusercontent.com/qwright10/cen3031/b9c91d180db98af23d421c1061abce1eff06ba30/.github/logotype.png" alt="SnapCards logotype" width="500px" />
    </a>
  </p>
  <br />
  <p>
    <a href="https://vercel.com/?utm_source=quentin-wrights-projects">
      <img src="https://raw.githubusercontent.com/qwright10/cen3031/main/.github/powered-by-vercel.svg" alt="Vercel" />
    </a>
  </p>
</div>

## About

SnapCards is a web-based study platform that allows you to create, share, and study quizzes you make from study materials. It automatically scores quiz attempts and provides feedback about correct/incorrect answers and how you're is performing over time. SnapCards can be integrated into a busy college student’s study routine to review lecture material for a quiz, refresh his or her memory of a prerequisite course, or prepare for a cumulative final exam covering months of material.

## Getting Started

- Go to <a href="https://snapcards.org/">snapcards.org</a>
- Create an account
- Make a new quiz or browse quizzes from other users
- Take a quiz and review personalized feedback

## Running locally

1. Clone or download the repository main branch
2. Install the most recent LTS release of <a href="https://nodejs.org/en">Node.js</a>
3. Follow the installation instructions for <a href="https://pnpm.io/installation">pnpm</a>
4. (Option 1) Deploy a PostgreSQL 17 instance
    - Follow the <a href="https://www.postgresql.org/download">installation instructions</a>
    - Create a database for the project
    - Create a user with read and write access to the database
    - Run the `*.sql` migrations in `server/migrations` in order
    - `<host>` for Step 9 will most likely be `localhost`
5. **(Preferred option 2) Use this project's existing instance**
    - Credentials are available in the documentation report
6. Open a terminal at the repository directory in Step 1
7. Move to the `site/` directory, then run `pnpm install`
8. Generate a JWT secret by running `openssl rand 32 | openssl base64`
9. Create a `.env` file with the following contents, replacing `<user>`, `<pass>`, `<host>`, `<database>`, and `<jwt_secret>` with the appropriate values from Steps 4 and 8
  ```
  DATABASE_URL=postgres://<user>:<pass>@<host>:5432/<database>
  JWT_SECRET=<jwt_secret>
  ```
10. (Option 1) Start the Next.js dev server
    - Run `pnpm run dev`
11. (Option 2) Or create and start a production build
    - Run `pnpm run build && pnpm start`
    - Wait for the build process to finish
12. Navigate to the "Local" url displayed in the terminal window

N.B. The site uses some web APIs only available in secure contexts, so servers without valid TLS certificates *must* be accessed from `localhost` (a secure context).

<hr />

#### CEN 3031 Group Project (Group 7)

Wonchae Lee, Justin Oh, and Quentin Wright
