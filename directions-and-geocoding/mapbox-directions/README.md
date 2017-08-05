query {
  getSteps(
    startLng: -73.989
    startLat: 40.733
    endLng: -74
    endLat: 40.733
  ) {
    steps
  }
}

{
  "data": {
    "getSteps": {
      "steps": {
        "maneuvers": [
          "Head northwest on East 13th Street",
          "Turn left onto University Place",
          "Turn right onto East 9th Street",
          "Continue straight onto West 9th Street",
          "Turn left onto 6th Avenue",
          "Turn right onto Christopher Street",
          "Turn left onto 6th Avenue",
          "You have arrived at your destination"
        ]
      }
    }
  }
}
