Feature: Official Brick Colors Catalog

  Scenario: Listing all official brick colors
    When I list the official brick colors
    Then exactly 41 colors should be returned
    And each color must have an ID, an official name, and a valid hex code
    And the list should contain "Bright Green" with ID 15 and hex "#4B9F4A"
    And the list should contain "Medium Stone Grey" with ID 2 and hex "#A0A5A9"
