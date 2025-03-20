#!/bin/bash
# Script to deploy the Expense Splitter App

# Display ASCII art header
echo "==============================================="
echo "   ______                                     "
echo "  |  ____|                                    "
echo "  | |__  __  ___ __   ___ _ __  ___  ___      "
echo "  |  __| \ \/ / '_ \ / _ \ '_ \/ __|/ _ \     "
echo "  | |____ >  <| |_) |  __/ | | \__ \  __/     "
echo "  |______/_/\_\ .__/ \___|_| |_|___/\___|     "
echo "              | |                             "
echo "              |_|        ___ _   _            "
echo "   / __\ _ __ | (_) |_ |/ __| | (_) |_| |_ ___ _ __  "
echo "   \__ \| '_ \| | | __/|__ \ |_| | | | __| _  | '_  \ "
echo "   |___/| |_) | | | |_ |___/ ___ | | |_| | (_) | | | |"
echo "        | .__/|_|  \__||____/   |_|\__|_|\___/|_| |_|"
echo "        |_|                                      "
echo "==============================================="
echo "     Deployment Script - Version 1.0.0         "
echo "==============================================="
echo ""

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "Error: Docker is not installed."
        echo "Please install Docker from https://www.docker.com/get-started"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo "Error: Docker Compose is not installed."
        echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
        exit 1
    fi
}

# Function to start the application
start_app() {
    echo "Starting Expense Splitter App..."
    docker-compose up -d
    
    echo ""
    echo "Expense Splitter App is now running!"
    echo "- Frontend: http://localhost:3000"
    echo "- API: http://localhost:7156"
    echo "- API Documentation: http://localhost:7156/swagger"
    echo ""
}

# Function to stop the application
stop_app() {
    echo "Stopping Expense Splitter App..."
    docker-compose down
    echo "Application stopped."
}

# Function to display logs
show_logs() {
    docker-compose logs -f
}

# Main script logic
check_docker

case "$1" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        stop_app
        start_app
        ;;
    logs)
        show_logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs}"
        echo "  start   - Start the application"
        echo "  stop    - Stop the application"
        echo "  restart - Restart the application"
        echo "  logs    - View application logs"
        exit 1
esac

exit 0
