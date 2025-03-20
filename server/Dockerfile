FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["FullStackApp.csproj", "./"]
RUN dotnet restore "FullStackApp.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "FullStackApp.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FullStackApp.csproj" -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FullStackApp.dll"]
