FROM php:8.2-fpm-alpine

# Install system deps
RUN apk add --no-cache \
    nginx \
    supervisor \
    mysql-client \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    unzip \
    git \
    curl

# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_mysql \
        gd \
        zip \
        opcache \
        bcmath \
        exif

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy Laravel files
COPY . .

# Install deps & optimize
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Nginx config
COPY default.conf /etc/nginx/http.d/default.conf

# Supervisor config for Nginx + PHP-FPM
RUN echo "[supervisord]\nnodaemon=true\n\n\
[program:php-fpm]\ncommand=php-fpm -F\nautostart=true\nautorestart=true\n\n\
[program:nginx]\ncommand=nginx -g 'daemon off;'\nautostart=true\nautorestart=true\n" > /etc/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
