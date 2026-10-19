Feature: API-Driven SQLite Persistence & Server Restart Recovery

  Scenario: Recovering created and painted asset state through the API after a server restart
    Given a file-backed API server with an active asset named "Fortress Alpha" of 32 by 24 studs
    When I paint the area (4, 4, 6, 6) with brick color ID 17
    And I update the asset name to "Fortress Alpha Prime"
    And I update the asset to dimensions 28 by 20 studs
    And the server restarts and reconnects to the SQLite database file
    Then the asset list should contain "Fortress Alpha Prime" with dimensions 28 by 20 and 36 painted cells
    And the asset width should be 28 studs
    And the asset height should be 20 studs
    And the asset name should be "Fortress Alpha Prime"
    And exactly 36 cells should be painted
    And the cell at (4, 4) should have brick color ID 17
    And the cell at (9, 9) should have brick color ID 17
    And the cell at (0, 0) should be unpainted

  Scenario: Erasing cells and deleting an asset persists across a server restart
    Given a file-backed API server with an active asset named "Temporary Outpost" of 16 by 16 studs
    When I paint the area (0, 0, 4, 4) with brick color ID 5
    And I paint the area (0, 0, 2, 2) with brick color ID 0
    And the server restarts and reconnects to the SQLite database file
    Then the asset list should contain "Temporary Outpost" with dimensions 16 by 16 and 12 painted cells
    And the cell at (0, 0) should be unpainted
    And the cell at (3, 3) should have brick color ID 5
    When I delete the asset
    And the server restarts and reconnects to the SQLite database file
    Then the asset should no longer exist
