Feature: SQLite Relational Persistence & State Durability

  Scenario: Recovering terrain map state after database reopen
    Given an initialized SQLite database with current migrations
    When I persist a terrain map with dimensions 40 by 60 studs
    And I simulate a server restart and reopen the database
    Then the persisted terrain map should be recovered with dimensions 40 by 60 studs
