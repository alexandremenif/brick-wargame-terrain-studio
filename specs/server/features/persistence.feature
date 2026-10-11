Feature: SQLite Relational Persistence & State Durability

  Scenario: Recovering asset state and painted cells after database reopen
    Given an initialized SQLite database with current migrations
    When I persist an asset named "Ruined Outpost" with dimensions 40 by 60 studs
    And I persist a cell at (5, 5) with brick color ID 37
    And I simulate a server restart and reopen the database
    Then the persisted asset should be recovered with name "Ruined Outpost" and dimensions 40 by 60 studs
    And the recovered cell at (5, 5) should have brick color ID 37
