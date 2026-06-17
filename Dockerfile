FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    libonig-dev \
    libcurl4-openssl-dev \
    && docker-php-ext-install mysqli pdo pdo_mysql mbstring

RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

COPY . /var/www/html/

RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
