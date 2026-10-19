Feature: Asset Management & Spatial Invariants

  Background:
    Given a new asset named "Modular Outpost" with dimensions 32 by 32 studs

  Scenario: Creating an asset with arbitrary dimensions
    Then the asset width should be 32 studs
    And the asset height should be 32 studs
    And the asset name should be "Modular Outpost"
    And all cells should be unpainted

  Scenario: Updating asset dimensions
    When I update the asset to dimensions 48 by 24 studs
    Then the asset width should be 48 studs
    And the asset height should be 24 studs

  Scenario: Updating asset name
    When I update the asset name to "Forward Command Center"
    Then the asset name should be "Forward Command Center"

  Scenario: Cropping cells when shrinking asset dimensions
    When I paint the area (0, 0, 32, 32) with brick color ID 37
    Then exactly 1024 cells should be painted
    When I update the asset to dimensions 16 by 16 studs
    Then exactly 256 cells should be painted
    And the cell at (15, 15) should have brick color ID 37
    When I update the asset to dimensions 32 by 32 studs
    Then exactly 256 cells should be painted
    And the cell at (16, 16) should be unpainted

  Scenario: Painting an area with official brick color
    When I paint the area (10, 10, 10, 10) with brick color ID 37
    Then the cell at (10, 10) should have brick color ID 37
    And exactly 100 cells should be painted

  Scenario: Painting a single cell via 1x1 area
    When I paint the area (5, 5, 1, 1) with brick color ID 1
    Then the cell at (5, 5) should have brick color ID 1
    And exactly 1 cells should be painted

  Scenario: Rejecting painting with invalid color ID
    When I attempt to paint the area (5, 5, 1, 1) with brick color ID 212
    Then an invalid action error should be raised

  Scenario: Erasing an area by passing color ID 0
    When I paint the area (10, 10, 5, 5) with brick color ID 37
    Then exactly 25 cells should be painted
    When I paint the area (10, 10, 5, 5) with brick color ID 0
    Then exactly 0 cells should be painted
    And the cell at (10, 10) should be unpainted

  Scenario: Lenient painting partially outside asset bounds
    When I paint the area (28, 28, 8, 8) with brick color ID 37
    Then exactly 16 cells should be painted
    And the cell at (31, 31) should have brick color ID 37

  Scenario: Lenient painting completely outside asset bounds
    When I paint the area (40, 40, 5, 5) with brick color ID 37
    Then exactly 0 cells should be painted

  Scenario: Lenient painting with negative coordinates
    When I paint the area (-2, -2, 5, 5) with brick color ID 37
    Then exactly 9 cells should be painted
    And the cell at (0, 0) should have brick color ID 37

  Scenario: Listing assets reflects updated summary metadata and painted cell count
    When I paint the area (0, 0, 4, 4) with brick color ID 15
    And I update the asset name to "Refinery Sector"
    And I update the asset to dimensions 40 by 20 studs
    Then the asset list should contain "Refinery Sector" with dimensions 40 by 20 and 16 painted cells

  Scenario: Deleting an asset
    When I delete the asset
    Then the asset should no longer exist

