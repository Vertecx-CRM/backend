FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY . .
RUN yarn build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true && yarn cache clean
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/certs ./src/certs
EXPOSE 3001
CMD ["yarn", "start:prod"]
