@ui
Feature: Top Header Bar Interactions & Asset Lifecycle

  Background:
    Given the UI is loaded with an active asset named "Modular Outpost" of 32 by 32 studs

  Scenario: Displaying asset name and dimensions
    Then the header should display asset name "Modular Outpost"
    And the width input should be 32
    And the height input should be 32

  Scenario: Updating asset dimensions via header inputs
    When I change the width input to 48
    And I change the height input to 24
    Then the asset width should be updated to 48 studs
    And the asset height should be updated to 24 studs

  Scenario: Enforcing strictly positive dimension inputs
    When I attempt to enter a width of 0
    Then the width input should revert to 32

  Scenario: Opening the delete asset confirmation modal
    When I click the "Delete" button in the header
    Then the delete confirmation modal should be displayed
    And the modal should display the warning for asset "Modular Outpost" with dimensions 32 by 32 studs

  Scenario: Cancelling asset deletion in the confirmation modal
    Given the delete confirmation modal is open for "Modular Outpost"
    When I click the "Cancel" button in the modal
    Then the modal should be closed
    And the asset "Modular Outpost" should still exist and remain active

  Scenario: Confirming asset deletion in the confirmation modal
    Given the delete confirmation modal is open for "Modular Outpost"
    When I click the "Delete Asset" button in the modal
    Then the modal should be closed
    And the asset "Modular Outpost" should be deleted
