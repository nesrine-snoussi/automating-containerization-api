FROM openjdk:11
 WORKDIR /app 
COPY . . 
EXPOSE 8080 
CMD ["java", "-jar", "your-java-application.jar"]