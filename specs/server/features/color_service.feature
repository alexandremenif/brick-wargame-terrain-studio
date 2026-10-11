@server @color
Feature: Color Service Static Catalog & In-Memory Caching

  Scenario: Loading the static official brick colors CSV into memory
    When the color service is initialized with the official colors catalog
    Then exactly 41 brick colors should be loaded into memory
    And the color catalog should contain color ID 194 named "Medium Stone Grey" with hex "#969696"
    And the color catalog should contain color ID 28 named "Dark Green" with hex "#184632"
    And the color catalog should contain color ID 37 named "Bright Green" with hex "#4B9F4A"

  Scenario: Querying colors from the in-memory cache without repeated file reads
    Given the color service is already loaded with the static catalog
    When I request the complete list of colors
    Then all 41 colors should be returned directly from the in-memory cache
    And no disk read operations should be performed for subsequent color requests

  Scenario: Validating official color IDs
    Given the color service is initialized
    When I check validity of color ID 194
    Then it should be recognized as a valid official brick color
    When I check validity of color ID 9999
    Then it should be rejected as an invalid color ID
    When I check validity of color ID -1
    Then it should be rejected as an invalid color ID

  Scenario: Fetching a specific color by its official numeric ID
    Given the color service is initialized
    When I retrieve the color by ID 24
    Then the retrieved color should have name "Bright Yellow" and hex "#F2CD37"
    When I retrieve the color by ID 999
    Then no color should be returned
