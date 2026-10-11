@ui
Feature: Viewport Bounding Box Persistence & Restoration

  Scenario: Restoring persisted bounding box upon asset load
    Given asset "Modular Outpost" has a persisted bounding box (4, 6, 12, 10) in storage
    When the UI is loaded with active asset "Modular Outpost" of 32 by 32 studs
    Then the inspector inputs should reflect X 4, Y 6, Width 12, Height 10
    And the canvas viewport should frame the subregion (4, 6, 12, 10)
    And the minimap should display the bounding box indicator at position (4, 6, 12, 10) on the 32 by 32 asset

  Scenario: Defaulting to full asset when no stored bounding box exists
    Given asset "Desert Stronghold" has no persisted bounding box in storage
    When the UI is loaded with active asset "Desert Stronghold" of 48 by 24 studs
    Then the inspector inputs should reflect X 0, Y 0, Width 48, Height 24
    And the canvas viewport should frame the full asset (0, 0, 48, 24)

  Scenario: Recovering and healing a stale bounding box when asset was shrunk
    Given asset "Outpost Beta" has a persisted bounding box (20, 20, 20, 20) in storage
    When the asset "Outpost Beta" dimensions are currently 16 by 16 studs
    And the UI is loaded with active asset "Outpost Beta"
    Then the inspector inputs should reflect X 0, Y 0, Width 16, Height 16
    And the persisted bounding box in storage for "Outpost Beta" should be self-healed to (0, 0, 16, 16)

  Scenario: Persisting bounding box changes to storage
    Given the UI is loaded with an active asset named "Modular Outpost" of 32 by 32 studs
    When I enter bounding box coordinates X 8, Y 8, Width 16, Height 16
    Then the storage entry for "Modular Outpost" should contain bounding box (8, 8, 16, 16)

  Scenario: Removing persisted bounding box on asset deletion
    Given asset "Modular Outpost" has a persisted bounding box (8, 8, 16, 16) in storage
    When I click the "Delete" button in the header
    And I click the "Delete Asset" button in the modal
    Then the storage entry for "Modular Outpost" should be removed
