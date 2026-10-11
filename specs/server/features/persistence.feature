Feature: SQLite Relational Persistence & State Durability

  Scenario: Recovering asset state and painted cells after database reopen
    Given an initialized SQLite database with current migrations
    When I persist an asset named "Ruined Outpost" with dimensions 40 by 60 studs
    And I persist a cell at (5, 5) with brick color ID 37
    And I simulate a server restart and reopen the database
    Then the persisted asset should be recovered with name "Ruined Outpost" and dimensions 40 by 60 studs
    And the recovered cell at (5, 5) should have brick color ID 37

  Scenario: Cascading cell deletion when deleting an asset via AssetRepository
    Given an asset named "Watchtower" with dimensions 20 by 20 studs exists in the database
    And 15 painted cells exist for this asset
    When I delete the asset via the asset repository
    Then the asset should no longer exist in the database
    And all 15 cells should be cascaded and deleted from the cells table

  Scenario: Trimming cells outside bounds when downsizing an asset
    Given an asset named "Large Bunker" with dimensions 32 by 32 studs exists in the database
    And a cell is painted at coordinate (25, 25)
    When I update the asset dimensions to 20 by 20 studs via the repository
    Then the asset dimensions should be updated to 20 by 20 studs
    And the cell at (25, 25) should be deleted from storage
