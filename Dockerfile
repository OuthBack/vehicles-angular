FROM node:16.14.0 as build

WORKDIR /app
COPY . .

RUN npm i -g pnpm && pnpm install

RUN pnpm install
RUN pnpm ng build

FROM nginx as runtime
COPY --from=build /app/dist/vehicle-angular /usr/share/nginx/html
