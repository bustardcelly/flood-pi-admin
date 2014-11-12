Feature: Request levels in time range
  As a User of the flood-pi-admin
  I want to be able to parse level reading based on time spans
  So I can get a better understanding of system readings

  Scenario: Request levels in day range
    Given There are 5 level readings store for the current 24 hour period
    When I request a range of "day"
    Then I am returned 5 level readings
