@server @asset_service
Feature: Asset Service Application Orchestration

  Background:
    Given the asset service is initialized with a repository and color service

  Scenario: Creating a new asset with validated dimensions
    When I dispatch CreateAssetCommand with name "Desert Ridge", width 48, height 48
    Then the asset service should return a newly created Asset with a generated UUID
    And the returned asset should have name "Desert Ridge" and dimensions 48 by 48 studs
    And the created asset should be retrievable from the repository

  Scenario: Rejecting asset creation with invalid dimensions
    When I dispatch CreateAssetCommand with name "Invalid Grid", width 0, height 50
    Then the command should be rejected with an invalid dimensions error
    When I dispatch CreateAssetCommand with name "Oversized Grid", width 1001, height 50
    Then the command should be rejected with an invalid dimensions error

  Scenario: Retrieving full asset state by ID
    Given an asset named "Supply Depot" with dimensions 32 by 32 studs and 5 painted cells exists
    When I dispatch GetAssetCommand for the asset ID
    Then the returned asset should contain all 5 painted cells
    And the response should match GetAssetResponse schema

  Scenario: Retrieving a nonexistent asset
    When I dispatch GetAssetCommand for nonexistent ID "nonexistent-uuid-0000"
    Then the command should fail with an asset not found error

  Scenario: Listing asset summaries
    Given 2 assets exist in the system
    When I dispatch ListAssetsCommand
    Then the response should contain exactly 2 asset summaries
    And the summaries should omit cell arrays

  Scenario: Updating asset properties and downsizing
    Given an asset named "Original Bunker" with dimensions 32 by 32 studs and a cell at (25, 25) exists
    When I dispatch UpdateAssetCommand with name "Renamed Bunker", width 20, height 20
    Then the asset name should become "Renamed Bunker"
    And the asset dimensions should become 20 by 20 studs
    And cells outside (20, 20) like (25, 25) should be trimmed

  Scenario: Deleting an asset
    Given an asset named "Temporary Trench" exists
    When I dispatch DeleteAssetCommand for the asset ID
    Then the command should return success true
    And the asset should no longer exist in the system

  Scenario: Painting an area on an asset with a valid color
    Given an asset with dimensions 32 by 32 studs exists
    When I dispatch PaintAreaCommand for bounding box (10, 10, 4, 4) with official color ID 194
    Then exactly 16 cells should be painted on the asset aggregate
    And all cells in bounding box (10, 10, 4, 4) should have color ID 194
    And the updated aggregate should be persisted in the repository

  Scenario: Erasing an area on an asset using null color
    Given an asset with bounding box (10, 10, 4, 4) painted with color ID 194
    When I dispatch PaintAreaCommand for bounding box (10, 10, 4, 4) with color ID null
    Then the 16 cells in bounding box (10, 10, 4, 4) should be cleared
    And the aggregate should have no painted cells in that region

  Scenario: Rejecting paint operation with nonexistent color ID
    Given an asset with dimensions 32 by 32 studs exists
    When I dispatch PaintAreaCommand for bounding box (0, 0, 2, 2) with color ID 9999
    Then the command should be rejected with an invalid color ID error

  Scenario: Lenient painting clipping against asset bounds
    Given an asset with dimensions 16 by 16 studs exists
    When I dispatch PaintAreaCommand for bounding box (14, 14, 4, 4) with color ID 28
    Then only cells within the 16 by 16 bounds should be painted
    And exactly 4 cells at coordinates (14,14), (14,15), (15,14), (15,15) should be painted
