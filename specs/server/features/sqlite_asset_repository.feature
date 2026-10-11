@server @persistence
Feature: SQLite Asset Repository Aggregate Lifecycle

  Background:
    Given an initialized SQLite database with current migrations and enabled foreign keys

  Scenario: Persisting and finding an Asset aggregate with painted cells
    When I create an asset aggregate named "Mountain Redoubt" with dimensions 32 by 32 studs via the repository
    And the asset aggregate has painted cells:
      | x  | y  | colorId |
      | 5  | 5  | 194     |
      | 10 | 12 | 28      |
    And I persist the asset aggregate via the repository
    When I find the asset by its identifier via the repository
    Then the reconstituted asset should have name "Mountain Redoubt"
    And the reconstituted asset should have dimensions 32 by 32 studs
    And the reconstituted asset should contain exactly 2 painted cells:
      | x  | y  | colorId |
      | 5  | 5  | 194     |
      | 10 | 12 | 28      |

  Scenario: Listing asset summaries without loading cell arrays
    Given 3 assets exist in the database with various painted cells
    When I list all assets via the repository
    Then exactly 3 asset summaries should be returned
    And the summaries should contain identifier, name, width, height, and timestamps
    And the summaries should omit cell collections for lightweight retrieval
    And the summaries should be ordered by creation timestamp descending

  Scenario: Updating an asset aggregate and synchronizing cell mutations
    Given an asset named "Forward Camp" with dimensions 16 by 16 studs exists in the repository
    And the asset has a painted cell at (2, 2) with color ID 194
    When the asset name is changed to "Forward Outpost"
    And the asset paints a new cell at (4, 4) with color ID 37
    And the asset clears the cell at (2, 2)
    And I update the asset aggregate via the repository
    When I find the asset by its identifier via the repository
    Then the reconstituted asset should have name "Forward Outpost"
    And the reconstituted asset should have exactly 1 painted cell at (4, 4) with color ID 37
    And the cell at (2, 2) should no longer exist

  Scenario: Trimming out-of-bounds cells when downsizing an asset aggregate
    Given an asset named "Large Bunker" with dimensions 32 by 32 studs exists in the repository
    And the asset has painted cells at (10, 10) and (25, 25)
    When the asset dimensions are reduced to 20 by 20 studs
    And I update the asset aggregate via the repository
    When I find the asset by its identifier via the repository
    Then the reconstituted asset should have dimensions 20 by 20 studs
    And the cell at (10, 10) should be preserved
    And the out-of-bounds cell at (25, 25) should be deleted from storage

  Scenario: Cascading deletion of an asset aggregate and all child cells
    Given an asset named "Watchtower" with dimensions 20 by 20 studs exists in the repository
    And the asset has 15 painted cells
    When I delete the asset by its identifier via the repository
    Then finding the asset by its identifier should return null
    And all 15 cells should be cascaded and deleted from the cells table in SQLite

  Scenario: Recovering asset aggregate state after database restart
    Given an asset named "Ruined Outpost" with dimensions 40 by 60 studs and a painted cell at (5, 5) with color ID 37
    When I simulate a server restart and reopen the SQLite database
    And I find the asset by its identifier via the repository
    Then the reconstituted asset should have name "Ruined Outpost" and dimensions 40 by 60 studs
    And the reconstituted asset should have the cell at (5, 5) with brick color ID 37
